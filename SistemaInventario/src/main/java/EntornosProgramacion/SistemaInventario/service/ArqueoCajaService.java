package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.request.AbrirArqueoRequest;
import EntornosProgramacion.SistemaInventario.dto.request.CerrarArqueoRequest;
import EntornosProgramacion.SistemaInventario.dto.response.ArqueoCajaResponse;
import EntornosProgramacion.SistemaInventario.exception.ResourceNotFoundException;
import EntornosProgramacion.SistemaInventario.model.ArqueoCaja;
import EntornosProgramacion.SistemaInventario.model.Usuario;
import EntornosProgramacion.SistemaInventario.repository.ArqueoCajaRepository;
import EntornosProgramacion.SistemaInventario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import EntornosProgramacion.SistemaInventario.model.RoleName;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArqueoCajaService {

    private final ArqueoCajaRepository arqueoCajaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public ArqueoCajaResponse abrirArqueo(AbrirArqueoRequest request, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        arqueoCajaRepository.findByUsuarioIdAndAbiertoTrue(usuario.getId()).ifPresent(a -> {
            throw new IllegalStateException("Ya existe un arqueo abierto. Ciérrelo antes de abrir uno nuevo.");
        });

        ArqueoCaja arqueo = ArqueoCaja.builder()
            .montoInicial(request.montoInicial())
            .montoVentasEfectivo(BigDecimal.ZERO)
            .montoFinalEsperado(request.montoInicial())
            .observaciones(request.observaciones())
            .usuario(usuario)
            .abierto(true)
            .build();

        return toResponse(arqueoCajaRepository.save(arqueo));
    }

    @Transactional
    public ArqueoCajaResponse cerrarArqueo(Long arqueoId, CerrarArqueoRequest request, String userEmail) {
        ArqueoCaja arqueo = arqueoCajaRepository.findById(arqueoId)
            .orElseThrow(() -> new ResourceNotFoundException("Arqueo no encontrado: " + arqueoId));

        if (!arqueo.getAbierto()) {
            throw new IllegalStateException("Este arqueo ya fue cerrado.");
        }

        // Solo el mismo usuario que abrió puede cerrar (o un admin)
        Usuario solicitante = usuarioRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        boolean esAdmin = solicitante.getRol() != null &&
            RoleName.ADMIN.equals(solicitante.getRol().getNombre());
        if (!arqueo.getUsuario().getEmail().equals(userEmail) && !esAdmin) {
            throw new AccessDeniedException("Solo el usuario que abrió el arqueo o un administrador puede cerrarlo.");
        }

        arqueo.setFechaCierre(OffsetDateTime.now());
        arqueo.setMontoFinalReal(request.montoFinalReal());
        arqueo.setDiferencia(request.montoFinalReal().subtract(arqueo.getMontoFinalEsperado()));
        arqueo.setAbierto(false);
        if (request.observaciones() != null) {
            arqueo.setObservaciones(request.observaciones());
        }

        return toResponse(arqueoCajaRepository.save(arqueo));
    }

    @Transactional(readOnly = true)
    public List<ArqueoCajaResponse> listarTodos() {
        return arqueoCajaRepository.findAllByOrderByFechaAperturaDesc()
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ArqueoCajaResponse obtenerPorId(Long id) {
        return toResponse(arqueoCajaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Arqueo no encontrado: " + id)));
    }

    @Transactional(readOnly = true)
    public ArqueoCajaResponse obtenerArqueoAbierto(String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return arqueoCajaRepository.findByUsuarioIdAndAbiertoTrue(usuario.getId())
            .map(this::toResponse)
            .orElse(null);
    }

    private ArqueoCajaResponse toResponse(ArqueoCaja a) {
        return new ArqueoCajaResponse(
            a.getId(),
            a.getFechaApertura(),
            a.getFechaCierre(),
            a.getMontoInicial(),
            a.getMontoVentasEfectivo(),
            a.getMontoFinalEsperado(),
            a.getMontoFinalReal(),
            a.getDiferencia(),
            a.getObservaciones(),
            a.getAbierto(),
            a.getUsuario().getId(),
            a.getUsuario().getEmail()
        );
    }
}
