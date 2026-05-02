package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.request.CategoriaRequest;
import EntornosProgramacion.SistemaInventario.dto.response.CategoriaResponse;
import EntornosProgramacion.SistemaInventario.exception.BusinessException;
import EntornosProgramacion.SistemaInventario.exception.ResourceNotFoundException;
import EntornosProgramacion.SistemaInventario.model.Categoria;
import EntornosProgramacion.SistemaInventario.repository.CategoriaRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarTodas() {
        return categoriaRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtenerPorId(String id) {
        Categoria categoria = getCategoriaById(id);
        return toResponse(categoria);
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        String nombreNormalizado = request.nombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCase(nombreNormalizado)) {
            throw new BusinessException("Ya existe una categoria con ese nombre");
        }

        Categoria categoria = Categoria.builder().nombre(nombreNormalizado).descripcion(request.descripcion()).build();

        return toResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponse actualizar(String id, CategoriaRequest request) {
        Categoria categoria = getCategoriaById(id);
        String nombreNormalizado = request.nombre().trim();

        if (
            !categoria.getNombre().equalsIgnoreCase(nombreNormalizado) &&
            categoriaRepository.existsByNombreIgnoreCase(nombreNormalizado)
        ) {
            throw new BusinessException("Ya existe una categoria con ese nombre");
        }

        categoria.setNombre(nombreNormalizado);
        categoria.setDescripcion(request.descripcion());

        return toResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminar(String id) {
        Categoria categoria = getCategoriaById(id);
        if (!categoria.getProductos().isEmpty()) {
            throw new BusinessException("No se puede eliminar una categoria con productos asociados");
        }
        categoriaRepository.delete(categoria);
    }

    private Categoria getCategoriaById(String id) {
        return categoriaRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada con id: " + id));
    }

    private CategoriaResponse toResponse(Categoria categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getNombre(), categoria.getDescripcion());
    }
}
