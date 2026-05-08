package EntornosProgramacion.SistemaInventario.controller;

import EntornosProgramacion.SistemaInventario.dto.response.RolConPermisosResponse;
import EntornosProgramacion.SistemaInventario.service.PermisoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permisos")
@RequiredArgsConstructor
public class PermisoController {

    private final PermisoService permisoService;

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RolConPermisosResponse>> listarRolesConPermisos() {
        return ResponseEntity.ok(permisoService.listarRolesConPermisos());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RolConPermisosResponse.PermisoResponse>> listarTodos() {
        return ResponseEntity.ok(permisoService.listarTodosLosPermisos());
    }

    @PutMapping("/roles/{rolId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RolConPermisosResponse> actualizarPermisosRol(
            @PathVariable Long rolId,
            @RequestBody List<Long> permisosIds) {
        return ResponseEntity.ok(permisoService.actualizarPermisosRol(rolId, permisosIds));
    }
}
