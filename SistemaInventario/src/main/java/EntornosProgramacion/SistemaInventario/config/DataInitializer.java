package EntornosProgramacion.SistemaInventario.config;

import EntornosProgramacion.SistemaInventario.model.RoleName;
import EntornosProgramacion.SistemaInventario.model.Rol;
import EntornosProgramacion.SistemaInventario.model.Usuario;
import EntornosProgramacion.SistemaInventario.repository.RolRepository;
import EntornosProgramacion.SistemaInventario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin:false}")
    private boolean seedAdmin;

    @Value("${app.seed-admin.email:}")
    private String adminEmail;

    @Value("${app.seed-admin.password:}")
    private String adminPassword;

    @Value("${app.seed-admin.nombre:Administrador}")
    private String adminNombre;

    @Override
    public void run(String... args) {
        Rol adminRole = ensureRole(RoleName.ADMIN);
        ensureRole(RoleName.EMPLEADO);

        if (!seedAdmin || adminEmail == null || adminEmail.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        String normalizedAdminEmail = adminEmail.trim().toLowerCase();

        Usuario adminUser = usuarioRepository.findByEmailWithRol(normalizedAdminEmail).orElse(null);

        if (adminUser == null) {
            Usuario admin = Usuario
                .builder()
                .nombre(adminNombre)
                .email(normalizedAdminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .activo(true)
                .rol(adminRole)
                .build();
            usuarioRepository.save(admin);
            return;
        }

        boolean needsUpdate = false;

        if (!RoleName.ADMIN.equals(adminUser.getRol().getNombre())) {
            adminUser.setRol(adminRole);
            needsUpdate = true;
        }

        if (!Boolean.TRUE.equals(adminUser.getActivo())) {
            adminUser.setActivo(true);
            needsUpdate = true;
        }

        if (needsUpdate) {
            usuarioRepository.save(adminUser);
        }
    }

    private Rol ensureRole(RoleName roleName) {
        return rolRepository
            .findByNombre(roleName)
            .orElseGet(() -> rolRepository.save(Rol.builder().nombre(roleName).build()));
    }
}
