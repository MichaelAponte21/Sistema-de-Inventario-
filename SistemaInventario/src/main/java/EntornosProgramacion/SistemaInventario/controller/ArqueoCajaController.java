package EntornosProgramacion.SistemaInventario.controller;

import EntornosProgramacion.SistemaInventario.dto.request.AbrirArqueoRequest;
import EntornosProgramacion.SistemaInventario.dto.request.CerrarArqueoRequest;
import EntornosProgramacion.SistemaInventario.dto.response.ArqueoCajaResponse;
import EntornosProgramacion.SistemaInventario.service.ArqueoCajaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/arqueos")
@RequiredArgsConstructor
public class ArqueoCajaController {

    private final ArqueoCajaService arqueoCajaService;

    @PostMapping("/abrir")
    public ResponseEntity<ArqueoCajaResponse> abrirArqueo(
        @Valid @RequestBody AbrirArqueoRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(arqueoCajaService.abrirArqueo(request, authentication.getName()));
    }

    @PutMapping("/{id}/cerrar")
    public ResponseEntity<ArqueoCajaResponse> cerrarArqueo(
        @PathVariable Long id,
        @Valid @RequestBody CerrarArqueoRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.ok(arqueoCajaService.cerrarArqueo(id, request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ArqueoCajaResponse>> listarTodos() {
        return ResponseEntity.ok(arqueoCajaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArqueoCajaResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(arqueoCajaService.obtenerPorId(id));
    }

    @GetMapping("/abierto")
    public ResponseEntity<ArqueoCajaResponse> obtenerArqueoAbierto(Authentication authentication) {
        ArqueoCajaResponse arqueo = arqueoCajaService.obtenerArqueoAbierto(authentication.getName());
        if (arqueo == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(arqueo);
    }
}
