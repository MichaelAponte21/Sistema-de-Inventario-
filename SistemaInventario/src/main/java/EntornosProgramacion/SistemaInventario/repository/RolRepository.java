package EntornosProgramacion.SistemaInventario.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import EntornosProgramacion.SistemaInventario.model.Rol;
import EntornosProgramacion.SistemaInventario.model.RoleName;

public interface RolRepository extends MongoRepository<Rol, String> {
    Optional<Rol> findByNombre(RoleName nombre);
}
