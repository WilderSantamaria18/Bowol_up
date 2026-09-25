package com.bowol.source;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrendSourceRepository extends JpaRepository<TrendSource, Long> {

    Optional<TrendSource> findByCode(TrendSourceCode code);

    List<TrendSource> findByIsActiveTrue();

    boolean existsByCode(TrendSourceCode code);
}
