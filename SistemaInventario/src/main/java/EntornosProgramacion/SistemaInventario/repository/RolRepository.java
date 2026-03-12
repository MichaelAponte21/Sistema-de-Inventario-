package EntornosProgramacion.SistemaInventario.repository;

import EntornosProgramacion.SistemaInventario.model.Rol;
import EntornosProgramacion.SistemaInventario.model.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombre(RoleName nombre);
}
