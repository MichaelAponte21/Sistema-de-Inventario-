package EntornosProgramacion.SistemaInventario.repository;

import EntornosProgramacion.SistemaInventario.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    @Query("select u from Usuario u join fetch u.rol where u.email = :email")
    Optional<Usuario> findByEmailWithRol(@Param("email") String email);

    boolean existsByEmail(String email);
}
