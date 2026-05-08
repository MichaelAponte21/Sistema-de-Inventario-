package EntornosProgramacion.SistemaInventario.repository;

import EntornosProgramacion.SistemaInventario.model.NombrePermiso;
import EntornosProgramacion.SistemaInventario.model.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PermisoRepository extends JpaRepository<Permiso, Long> {
    Optional<Permiso> findByNombre(NombrePermiso nombre);
}
