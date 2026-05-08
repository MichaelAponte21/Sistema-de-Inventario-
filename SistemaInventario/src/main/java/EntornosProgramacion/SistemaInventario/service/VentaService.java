package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.request.VentaRequest;
import EntornosProgramacion.SistemaInventario.dto.response.VentaResponse;
import EntornosProgramacion.SistemaInventario.exception.ResourceNotFoundException;
import EntornosProgramacion.SistemaInventario.exception.StockInsuficienteException;
import EntornosProgramacion.SistemaInventario.model.*;
import EntornosProgramacion.SistemaInventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
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

        // Validar stock y calcular total antes de modificar nada
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

        // Resolver arqueo si se proporcionó, y validar que esté abierto
        ArqueoCaja arqueo = null;
        if (request.arqueoId() != null) {
            arqueo = arqueoCajaRepository.findById(request.arqueoId())
                .orElseThrow(() -> new ResourceNotFoundException("Arqueo no encontrado: " + request.arqueoId()));
            if (!arqueo.getAbierto()) {
                throw new IllegalStateException("No se puede asociar la venta a un arqueo de caja cerrado");
            }
        }

        // Crear y persistir la venta primero para obtener el ID
        Venta venta = Venta.builder()
            .total(total)
            .montoPagado(request.montoPagado())
            .cambio(cambio)
            .metodoPago(request.metodoPago())
            .usuario(usuario)
            .arqueo(arqueo)
            .build();

        Venta savedVenta = ventaRepository.save(venta);

        // Crear detalles, descontar stock y registrar movimientos
        for (VentaRequest.DetalleVentaRequest item : request.items()) {
            Producto producto = productoRepository.findById(item.productoId()).get();

            DetalleVenta detalle = DetalleVenta.builder()
                .venta(savedVenta)
                .producto(producto)
                .cantidad(item.cantidad())
                .precioUnitario(producto.getPrecio())
                .build();

            savedVenta.getDetalles().add(detalle);

            producto.setStock(producto.getStock() - item.cantidad());
            productoRepository.save(producto);

            MovimientoInventario movimiento = MovimientoInventario.builder()
                .tipo(TipoMovimiento.SALIDA)
                .cantidad(item.cantidad())
                .observacion("Venta #" + savedVenta.getId())
                .producto(producto)
                .usuario(usuario)
                .build();
            movimientoRepository.save(movimiento);
        }

        // Solo sumar a montoVentasEfectivo cuando el pago es en efectivo
        if (arqueo != null && "EFECTIVO".equalsIgnoreCase(request.metodoPago())) {
            arqueo.setMontoVentasEfectivo(arqueo.getMontoVentasEfectivo().add(total));
            arqueo.setMontoFinalEsperado(arqueo.getMontoInicial().add(arqueo.getMontoVentasEfectivo()));
            arqueoCajaRepository.save(arqueo);
        }

        return toResponse(ventaRepository.save(savedVenta));
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> listarTodas() {
        return ventaRepository.findAll(Sort.by(Sort.Direction.DESC, "fecha"))
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public VentaResponse obtenerPorId(Long id) {
        Venta venta = ventaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada: " + id));
        return toResponse(venta);
    }

    @Transactional
    public VentaResponse anularVenta(Long id, String userEmail) {
        Venta venta = ventaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada: " + id));

        if (VentaEstado.ANULADA.equals(venta.getEstado())) {
            throw new IllegalStateException("La venta #" + id + " ya fue anulada anteriormente");
        }

        Usuario usuario = usuarioRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        boolean esAdmin = RoleName.ADMIN.equals(usuario.getRol().getNombre());
        if (!venta.getUsuario().getEmail().equals(userEmail) && !esAdmin) {
            throw new AccessDeniedException("No tiene permiso para anular esta venta");
        }

        for (DetalleVenta detalle : venta.getDetalles()) {
            Producto producto = detalle.getProducto();
            producto.setStock(producto.getStock() + detalle.getCantidad());
            productoRepository.save(producto);

            MovimientoInventario movimiento = MovimientoInventario.builder()
                .tipo(TipoMovimiento.ENTRADA)
                .cantidad(detalle.getCantidad())
                .observacion("Anulacion Venta #" + venta.getId())
                .producto(producto)
                .usuario(usuario)
                .build();
            movimientoRepository.save(movimiento);
        }

        ArqueoCaja arqueo = venta.getArqueo();
        if (arqueo != null && Boolean.TRUE.equals(arqueo.getAbierto())
                && "EFECTIVO".equalsIgnoreCase(venta.getMetodoPago())) {
            BigDecimal nuevoEfectivo = arqueo.getMontoVentasEfectivo()
                .subtract(venta.getTotal()).max(BigDecimal.ZERO);
            arqueo.setMontoVentasEfectivo(nuevoEfectivo);
            arqueo.setMontoFinalEsperado(arqueo.getMontoInicial().add(nuevoEfectivo));
            arqueoCajaRepository.save(arqueo);
        }

        venta.setEstado(VentaEstado.ANULADA);
        return toResponse(ventaRepository.save(venta));
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
            v.getEstado() != null ? v.getEstado().name() : VentaEstado.COMPLETADA.name(),
            v.getUsuario().getId(),
            v.getUsuario().getEmail(),
            v.getArqueo() != null ? v.getArqueo().getId() : null,
            detalles
        );
    }
}
