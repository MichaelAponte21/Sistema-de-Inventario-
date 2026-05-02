package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.request.MovimientoRequest;
import EntornosProgramacion.SistemaInventario.dto.response.MovimientoResponse;
import EntornosProgramacion.SistemaInventario.exception.ResourceNotFoundException;
import EntornosProgramacion.SistemaInventario.exception.StockInsuficienteException;
import EntornosProgramacion.SistemaInventario.model.MovimientoInventario;
import EntornosProgramacion.SistemaInventario.model.Producto;
import EntornosProgramacion.SistemaInventario.model.TipoMovimiento;
import EntornosProgramacion.SistemaInventario.model.Usuario;
import EntornosProgramacion.SistemaInventario.repository.MovimientoInventarioRepository;
import EntornosProgramacion.SistemaInventario.repository.ProductoRepository;
import EntornosProgramacion.SistemaInventario.repository.UsuarioRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MovimientoService {

    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public MovimientoResponse registrarMovimiento(MovimientoRequest request, String userEmail) {
        Producto producto = productoRepository
            .findById(request.productoId())
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + request.productoId()));

        Usuario usuario = usuarioRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));

        if (request.tipo() == TipoMovimiento.SALIDA && request.cantidad() > producto.getStock()) {
            throw new StockInsuficienteException("Stock insuficiente para la salida solicitada");
        }

        int nuevoStock = producto.getStock();
        if (request.tipo() == TipoMovimiento.ENTRADA) {
            nuevoStock += request.cantidad();
        } else {
            nuevoStock -= request.cantidad();
        }

        producto.setStock(nuevoStock);
        productoRepository.save(producto);

        MovimientoInventario movimiento = MovimientoInventario
            .builder()
            .tipo(request.tipo())
            .cantidad(request.cantidad())
            .observacion(request.observacion())
            .producto(producto)
            .usuario(usuario)
            .build();

        MovimientoInventario saved = movimientoRepository.save(movimiento);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MovimientoResponse> listarTodos() {
        return movimientoRepository.findAll(Sort.by(Sort.Direction.DESC, "fecha")).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MovimientoResponse> listarPorProducto(String productoId) {
        return movimientoRepository.findByProductoId(productoId).stream().map(this::toResponse).toList();
    }

    private MovimientoResponse toResponse(MovimientoInventario movimiento) {
        return new MovimientoResponse(
            movimiento.getId(),
            movimiento.getTipo().name(),
            movimiento.getCantidad(),
            movimiento.getFecha(),
            movimiento.getObservacion(),
            movimiento.getProducto().getId(),
            movimiento.getProducto().getNombre(),
            movimiento.getUsuario().getId(),
            movimiento.getUsuario().getEmail()
        );
    }
}
