package EntornosProgramacion.SistemaInventario.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import EntornosProgramacion.SistemaInventario.model.Categoria;

public interface CategoriaRepository extends MongoRepository<Categoria, String> {
    Optional<Categoria> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);
}
