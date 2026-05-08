package EntornosProgramacion.SistemaInventario.controller;

import EntornosProgramacion.SistemaInventario.dto.request.VentaRequest;
import EntornosProgramacion.SistemaInventario.dto.response.VentaResponse;
import EntornosProgramacion.SistemaInventario.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PostMapping
    public ResponseEntity<VentaResponse> procesarVenta(
        @Valid @RequestBody VentaRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ventaService.procesarVenta(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<VentaResponse>> listarTodas() {
        return ResponseEntity.ok(ventaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtenerPorId(id));
    }

    @PostMapping("/{id}/anular")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasAuthority('VENTAS_ANULAR')")
    public ResponseEntity<VentaResponse> anularVenta(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ventaService.anularVenta(id, authentication.getName()));
    }
}
