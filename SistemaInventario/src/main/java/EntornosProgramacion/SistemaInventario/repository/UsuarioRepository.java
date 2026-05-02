package EntornosProgramacion.SistemaInventario.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import EntornosProgramacion.SistemaInventario.model.Usuario;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
}
