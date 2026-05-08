package EntornosProgramacion.SistemaInventario.config;

import EntornosProgramacion.SistemaInventario.model.*;
import EntornosProgramacion.SistemaInventario.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PermisoRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin:false}")
    private boolean seedAdmin;

    @Value("${app.seed-admin.email:}")
    private String adminEmail;

    @Value("${app.seed-admin.password:}")
    private String adminPassword;

    @Value("${app.seed-admin.nombre:Administrador}")
    private String adminNombre;

    private static final Map<NombrePermiso, String> DESCRIPCION_PERMISOS = Map.of(
        NombrePermiso.PRODUCTOS_CREAR,      "Crear nuevos productos",
        NombrePermiso.PRODUCTOS_EDITAR,     "Editar productos existentes",
        NombrePermiso.PRODUCTOS_ELIMINAR,   "Eliminar productos",
        NombrePermiso.CATEGORIAS_GESTIONAR, "Crear, editar y eliminar categorias",
        NombrePermiso.MOVIMIENTOS_CREAR,    "Registrar movimientos de inventario",
        NombrePermiso.VENTAS_ANULAR,        "Anular ventas completadas",
        NombrePermiso.REPORTES_VER,         "Ver reportes y estadisticas",
        NombrePermiso.USUARIOS_GESTIONAR,   "Crear, editar y desactivar usuarios"
    );

    @Override
    @Transactional
    public void run(String... args) {
        seedPermisos();

        Rol adminRole = ensureRole(RoleName.ADMIN, Set.of(NombrePermiso.values()));
        ensureRole(RoleName.EMPLEADO, Set.of(
            NombrePermiso.MOVIMIENTOS_CREAR,
            NombrePermiso.REPORTES_VER,
            NombrePermiso.VENTAS_ANULAR
        ));

        seedAdminUser(adminRole);
    }

    private void seedPermisos() {
        for (NombrePermiso nombre : NombrePermiso.values()) {
            permisoRepository.findByNombre(nombre).orElseGet(() ->
                permisoRepository.save(
                    Permiso.builder()
                        .nombre(nombre)
                        .descripcion(DESCRIPCION_PERMISOS.getOrDefault(nombre, nombre.name()))
                        .build()
                )
            );
        }
    }

    private Rol ensureRole(RoleName roleName, Set<NombrePermiso> permisosNombres) {
        Rol rol = rolRepository.findByNombre(roleName)
            .orElseGet(() -> rolRepository.save(Rol.builder().nombre(roleName).build()));

        boolean changed = false;
        for (NombrePermiso nombre : permisosNombres) {
            Permiso permiso = permisoRepository.findByNombre(nombre).orElseThrow();
            if (rol.getPermisos().stream().noneMatch(p -> p.getNombre() == nombre)) {
                rol.getPermisos().add(permiso);
                changed = true;
            }
        }
        return changed ? rolRepository.save(rol) : rol;
    }

    private void seedAdminUser(Rol adminRole) {
        if (!seedAdmin || adminEmail == null || adminEmail.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        String normalizedAdminEmail = adminEmail.trim().toLowerCase();
        Usuario adminUser = usuarioRepository.findByEmailWithRol(normalizedAdminEmail).orElse(null);

        if (adminUser == null) {
            usuarioRepository.save(Usuario.builder()
                .nombre(adminNombre)
                .email(normalizedAdminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .activo(true)
                .rol(adminRole)
                .build());
            log.info("Admin user created: {}", normalizedAdminEmail);
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
        if (!passwordEncoder.matches(adminPassword, adminUser.getPassword())) {
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            needsUpdate = true;
        }
        if (needsUpdate) {
            usuarioRepository.save(adminUser);
            log.info("Admin user updated: {}", normalizedAdminEmail);
        }
    }
}
