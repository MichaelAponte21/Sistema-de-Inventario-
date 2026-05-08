package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.response.RolConPermisosResponse;
import EntornosProgramacion.SistemaInventario.exception.ResourceNotFoundException;
import EntornosProgramacion.SistemaInventario.model.*;
import EntornosProgramacion.SistemaInventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermisoService {

    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;

    @Transactional(readOnly = true)
    public List<RolConPermisosResponse> listarRolesConPermisos() {
        return rolRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RolConPermisosResponse.PermisoResponse> listarTodosLosPermisos() {
        return permisoRepository.findAll().stream()
            .map(p -> new RolConPermisosResponse.PermisoResponse(p.getId(), p.getNombre().name(), p.getDescripcion()))
            .toList();
    }

    @Transactional
    public RolConPermisosResponse actualizarPermisosRol(Long rolId, List<Long> permisosIds) {
        Rol rol = rolRepository.findById(rolId)
            .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + rolId));

        if (RoleName.ADMIN.equals(rol.getNombre())) {
            throw new IllegalArgumentException("No se pueden modificar los permisos del rol ADMIN");
        }

        Set<Permiso> nuevosPermisos = new HashSet<>(permisoRepository.findAllById(permisosIds));
        rol.setPermisos(nuevosPermisos);
        return toResponse(rolRepository.save(rol));
    }

    private RolConPermisosResponse toResponse(Rol rol) {
        List<RolConPermisosResponse.PermisoResponse> permisos = rol.getPermisos().stream()
            .map(p -> new RolConPermisosResponse.PermisoResponse(
                p.getId(), p.getNombre().name(), p.getDescripcion()))
            .toList();
        return new RolConPermisosResponse(rol.getId(), rol.getNombre().name(), permisos);
    }
}
