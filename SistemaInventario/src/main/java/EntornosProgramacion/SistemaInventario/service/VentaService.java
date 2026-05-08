package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.request.VentaRequest;
import EntornosProgramacion.SistemaInventario.dto.response.VentaResponse;
import EntornosProgramacion.SistemaInventario.exception.ResourceNotFoundException;
import EntornosProgramacion.SistemaInventario.exception.StockInsuficienteException;
import EntornosProgramacion.SistemaInventario.model.*;
import EntornosProgramacion.SistemaInventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ArqueoCajaRepository arqueoCajaRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    @Transactional
    public VentaResponse procesarVenta(VentaRequest request, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userEmail));

        // Calcular total y validar stock antes de modificar nada
        BigDecimal total = BigDecimal.ZERO;
        for (VentaRequest.DetalleVentaRequest item : request.items()) {
            Producto producto = productoRepository.findById(item.productoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + item.productoId()));
            if (producto.getStock() < item.cantidad()) {
                throw new StockInsuficienteException(
                    "Stock insuficiente para: " + producto.getNombre() +
                    " (disponible: " + producto.getStock() + ", solicitado: " + item.cantidad() + ")"
                );
            }
            total = total.add(producto.getPrecio().multiply(BigDecimal.valueOf(item.cantidad())));
        }

        BigDecimal cambio = request.montoPagado().subtract(total);
        if (cambio.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Monto pagado insuficiente para cubrir el total de la venta");
        }

        // Resolver arqueo si viene
        ArqueoCaja arqueo = null;
        if (request.arqueoId() != null) {
            arqueo = arqueoCajaRepository.findById(request.arqueoId())
                .orElseThrow(() -> new ResourceNotFoundException("Arqueo no encontrado: " + request.arqueoId()));
        }

        // Crear la venta
        Venta venta = Venta.builder()
            .total(total)
            .montoPagado(request.montoPagado())
            .cambio(cambio)
            .metodoPago(request.metodoPago())
            .usuario(usuario)
            .arqueo(arqueo)
            .build();

        // Crear detalles, descontar stock y registrar movimientos
        for (VentaRequest.DetalleVentaRequest item : request.items()) {
            Producto producto = productoRepository.findById(item.productoId()).get();

            DetalleVenta detalle = DetalleVenta.builder()
                .venta(venta)
                .producto(producto)
                .cantidad(item.cantidad())
                .precioUnitario(producto.getPrecio())
                .build();

            venta.getDetalles().add(detalle);

            // Descontar stock
            producto.setStock(producto.getStock() - item.cantidad());
            productoRepository.save(producto);

            // Registrar movimiento de inventario
            MovimientoInventario movimiento = MovimientoInventario.builder()
                .tipo(TipoMovimiento.SALIDA)
                .cantidad(item.cantidad())
                .observacion("Venta #" + (venta.getId() != null ? venta.getId() : "nueva"))
                .producto(producto)
                .usuario(usuario)
                .build();
            movimientoRepository.save(movimiento);
        }

        // Actualizar monto de ventas en el arqueo
        if (arqueo != null) {
            arqueo.setMontoVentasEfectivo(arqueo.getMontoVentasEfectivo().add(total));
            arqueo.setMontoFinalEsperado(arqueo.getMontoInicial().add(arqueo.getMontoVentasEfectivo()));
            arqueoCajaRepository.save(arqueo);
        }

        Venta saved = ventaRepository.save(venta);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> listarTodas() {
        return ventaRepository.findAll(Sort.by(Sort.Direction.DESC, "fecha"))
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public VentaResponse obtenerPorId(Integer id) {
        Venta venta = ventaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada: " + id));
        return toResponse(venta);
    }

    private VentaResponse toResponse(Venta v) {
        List<VentaResponse.DetalleVentaResponse> detalles = v.getDetalles().stream()
            .map(d -> new VentaResponse.DetalleVentaResponse(
                d.getId(),
                d.getProducto().getId(),
                d.getProducto().getNombre(),
                d.getCantidad(),
                d.getPrecioUnitario(),
                d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad()))
            )).toList();

        return new VentaResponse(
            v.getId(),
            v.getFecha(),
            v.getTotal(),
            v.getMontoPagado(),
            v.getCambio(),
            v.getMetodoPago(),
            v.getUsuario().getId(),
            v.getUsuario().getEmail(),
            v.getArqueo() != null ? v.getArqueo().getId() : null,
            detalles
        );
    }
}
