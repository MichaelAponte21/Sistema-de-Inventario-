package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.request.ChangePasswordRequest;
import EntornosProgramacion.SistemaInventario.dto.request.UsuarioCreateRequest;
import EntornosProgramacion.SistemaInventario.dto.request.UsuarioUpdateRequest;
import EntornosProgramacion.SistemaInventario.dto.response.MessageResponse;
import EntornosProgramacion.SistemaInventario.dto.response.UsuarioResponse;
import EntornosProgramacion.SistemaInventario.exception.BusinessException;
import EntornosProgramacion.SistemaInventario.exception.ResourceNotFoundException;
import EntornosProgramacion.SistemaInventario.model.Rol;
import EntornosProgramacion.SistemaInventario.model.Usuario;
import EntornosProgramacion.SistemaInventario.repository.RolRepository;
import EntornosProgramacion.SistemaInventario.repository.UsuarioRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponse crear(UsuarioCreateRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new BusinessException("El email ya esta registrado");
        }

        Rol rol = rolRepository
            .findByNombre(request.rol())
            .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + request.rol()));

        Usuario usuario = Usuario.builder()
            .nombre(request.nombre().trim())
            .email(request.email().trim().toLowerCase())
            .password(passwordEncoder.encode(request.password()))
            .rol(rol)
            .activo(true)
            .build();

        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPorId(String id) {
        return toResponse(getUsuarioById(id));
    }

    @Transactional
    public UsuarioResponse actualizar(String id, UsuarioUpdateRequest request) {
        Usuario usuario = getUsuarioById(id);

        if (request.nombre() != null && !request.nombre().isBlank()) {
            usuario.setNombre(request.nombre().trim());
        }

        if (request.email() != null && !request.email().isBlank()) {
            String normalizedEmail = request.email().trim().toLowerCase();
            if (!normalizedEmail.equalsIgnoreCase(usuario.getEmail()) && usuarioRepository.existsByEmail(normalizedEmail)) {
                throw new BusinessException("El email ya esta en uso");
            }
            usuario.setEmail(normalizedEmail);
        }

        if (request.activo() != null) {
            usuario.setActivo(request.activo());
        }

        if (request.rol() != null) {
            Rol rol = rolRepository
                .findByNombre(request.rol())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + request.rol()));
            usuario.setRol(rol);
        }

        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void desactivar(String id) {
        Usuario usuario = getUsuarioById(id);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public MessageResponse cambiarPassword(String id, ChangePasswordRequest request) {
        Usuario usuario = getUsuarioById(id);
        usuario.setPassword(passwordEncoder.encode(request.nuevaPassword()));
        usuarioRepository.save(usuario);
        return new MessageResponse("Contraseña actualizada correctamente");
    }

    private Usuario getUsuarioById(String id) {
        return usuarioRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getEmail(),
            usuario.getRol().getNombre().name(),
            usuario.getActivo(),
            usuario.getFechaCreacion()
        );
    }
}
