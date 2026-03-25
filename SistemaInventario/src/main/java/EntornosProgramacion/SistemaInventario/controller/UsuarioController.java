package EntornosProgramacion.SistemaInventario.controller;

import EntornosProgramacion.SistemaInventario.dto.request.ChangePasswordRequest;
import EntornosProgramacion.SistemaInventario.dto.request.UsuarioCreateRequest;
import EntornosProgramacion.SistemaInventario.dto.request.UsuarioUpdateRequest;
import EntornosProgramacion.SistemaInventario.dto.response.MessageResponse;
import EntornosProgramacion.SistemaInventario.dto.response.UsuarioResponse;
import EntornosProgramacion.SistemaInventario.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> actualizar(
        @PathVariable Long id,
        @Valid @RequestBody UsuarioUpdateRequest request
    ) {
        return ResponseEntity.ok(usuarioService.actualizar(id, request));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<MessageResponse> cambiarPassword(
        @PathVariable Long id,
        @Valid @RequestBody ChangePasswordRequest request
    ) {
        return ResponseEntity.ok(usuarioService.cambiarPassword(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
        return ResponseEntity.ok(new MessageResponse("Usuario desactivado correctamente"));
    }
}
