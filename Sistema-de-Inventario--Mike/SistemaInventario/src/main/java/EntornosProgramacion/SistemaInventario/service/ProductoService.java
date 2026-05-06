package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.request.ProductoRequest;
import EntornosProgramacion.SistemaInventario.dto.response.ProductoResponse;
import EntornosProgramacion.SistemaInventario.exception.ResourceNotFoundException;
import EntornosProgramacion.SistemaInventario.model.Categoria;
import EntornosProgramacion.SistemaInventario.model.Producto;
import EntornosProgramacion.SistemaInventario.repository.CategoriaRepository;
import EntornosProgramacion.SistemaInventario.repository.ProductoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarTodos() {
        return productoRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerPorId(Long id) {
        return toResponse(getProductoById(id));
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarStockBajo() {
        return productoRepository.findStockBajo().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Categoria categoria = getCategoriaById(request.categoriaId());

        Producto producto = Producto
            .builder()
            .nombre(request.nombre().trim())
            .descripcion(request.descripcion())
            .precio(request.precio())
            .stock(request.stock())
            .stockMinimo(request.stockMinimo())
            .categoria(categoria)
            .build();

        return toResponse(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = getProductoById(id);
        Categoria categoria = getCategoriaById(request.categoriaId());

        producto.setNombre(request.nombre().trim());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(request.precio());
        producto.setStock(request.stock());
        producto.setStockMinimo(request.stockMinimo());
        producto.setCategoria(categoria);

        return toResponse(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = getProductoById(id);
        productoRepository.delete(producto);
    }

    private Producto getProductoById(Long id) {
        return productoRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
    }

    private Categoria getCategoriaById(Long id) {
        return categoriaRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada con id: " + id));
    }

    private ProductoResponse toResponse(Producto producto) {
        return new ProductoResponse(
            producto.getId(),
            producto.getNombre(),
            producto.getDescripcion(),
            producto.getPrecio(),
            producto.getStock(),
            producto.getStockMinimo(),
            producto.getCategoria().getId(),
            producto.getCategoria().getNombre(),
            producto.getFechaCreacion(),
            producto.getFechaActualizacion(),
            producto.isStockBajo()
        );
    }
}
