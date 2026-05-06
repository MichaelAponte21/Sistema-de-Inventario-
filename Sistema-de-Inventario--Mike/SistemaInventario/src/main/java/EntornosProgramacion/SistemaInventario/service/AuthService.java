package EntornosProgramacion.SistemaInventario.service;

import EntornosProgramacion.SistemaInventario.dto.request.LoginRequest;
import EntornosProgramacion.SistemaInventario.dto.request.RegisterRequest;
import EntornosProgramacion.SistemaInventario.dto.response.AuthResponse;
import EntornosProgramacion.SistemaInventario.dto.response.UsuarioResponse;
import EntornosProgramacion.SistemaInventario.exception.EmailAlreadyExistsException;
import EntornosProgramacion.SistemaInventario.model.RoleName;
import EntornosProgramacion.SistemaInventario.model.Rol;
import EntornosProgramacion.SistemaInventario.model.Usuario;
import EntornosProgramacion.SistemaInventario.repository.RolRepository;
import EntornosProgramacion.SistemaInventario.repository.UsuarioRepository;
import EntornosProgramacion.SistemaInventario.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public UsuarioResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("El email ya esta registrado");
        }

        Rol rolEmpleado = rolRepository
            .findByNombre(RoleName.EMPLEADO)
            .orElseGet(() -> rolRepository.save(Rol.builder().nombre(RoleName.EMPLEADO).build()));

        Usuario usuario = Usuario
            .builder()
            .nombre(request.nombre().trim())
            .email(request.email().trim().toLowerCase())
            .password(passwordEncoder.encode(request.password()))
            .rol(rolEmpleado)
            .activo(true)
            .build();

        Usuario saved = usuarioRepository.save(usuario);
        return toUsuarioResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        Usuario usuario = (Usuario) authentication.getPrincipal();
        String jwtToken = jwtService.generateToken(usuario);

        return new AuthResponse(
            jwtToken,
            "Bearer",
            jwtService.getJwtExpirationMs(),
            usuario.getEmail(),
            usuario.getRol().getNombre().name()
        );
    }

    private UsuarioResponse toUsuarioResponse(Usuario usuario) {
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
