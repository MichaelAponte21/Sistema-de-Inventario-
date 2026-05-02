package EntornosProgramacion.SistemaInventario.controller;

import EntornosProgramacion.SistemaInventario.dto.request.MovimientoRequest;
import EntornosProgramacion.SistemaInventario.dto.response.MovimientoResponse;
import EntornosProgramacion.SistemaInventario.service.MovimientoService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService movimientoService;

    @PostMapping
    public ResponseEntity<MovimientoResponse> registrarMovimiento(
        @Valid @RequestBody MovimientoRequest request,
        Authentication authentication
    ) {
        String userEmail = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(movimientoService.registrarMovimiento(request, userEmail));
    }

    @GetMapping
    public ResponseEntity<List<MovimientoResponse>> listarTodos() {
        return ResponseEntity.ok(movimientoService.listarTodos());
    }

    @GetMapping("/producto/{id}")
    public ResponseEntity<List<MovimientoResponse>> listarPorProducto(@PathVariable("id") String productoId) {
        return ResponseEntity.ok(movimientoService.listarPorProducto(productoId));
    }
}
