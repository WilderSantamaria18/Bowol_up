package com.bowol.experiment;

import com.bowol.experiment.dto.*;
import com.bowol.hypothesis.Hypothesis;
import com.bowol.hypothesis.HypothesisRepository;
import com.bowol.hypothesis.HypothesisService;
import com.bowol.hypothesis.HypothesisStatus;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExperimentService {

    private final ExperimentRepository experimentRepository;
    private final HypothesisService hypothesisService;
    private final HypothesisRepository hypothesisRepository;

    @Transactional(readOnly = true)
    public List<ExperimentResponse> getExperiments(UUID hypothesisId, ExperimentStatus status, UserPrincipal principal) {
        UUID orgId = principal.getOrganizationId();
        List<Experiment> list;

        if (hypothesisId != null && status != null) {
            list = experimentRepository.findAllByHypothesisIdAndOrganizationIdAndStatus(hypothesisId, orgId, status);
        } else if (hypothesisId != null) {
            list = experimentRepository.findAllByHypothesisIdAndOrganizationId(hypothesisId, orgId);
        } else if (status != null) {
            list = experimentRepository.findAllByOrganizationIdAndStatus(orgId, status);
        } else {
            list = experimentRepository.findAllByOrganizationId(orgId);
        }

        return list.stream().map(ExperimentResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExperimentResponse getExperimentById(UUID id, UserPrincipal principal) {
        Experiment experiment = getExperimentEntity(id, principal.getOrganizationId());
        return ExperimentResponse.from(experiment);
    }

    @Transactional(readOnly = true)
    public Experiment getExperimentEntity(UUID id, UUID organizationId) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Experimento no encontrado: " + id));

        if (!experiment.getOrganizationId().equals(organizationId)) {
            throw new NotFoundException("Experimento no encontrado: " + id);
        }
        return experiment;
    }

    @Transactional
    public ExperimentResponse createExperiment(CreateExperimentRequest request, UserPrincipal principal) {
        UUID orgId = principal.getOrganizationId();
        Hypothesis hypothesis = hypothesisService.getHypothesisEntity(request.getHypothesisId(), orgId);

        Experiment experiment = Experiment.builder()
                .organizationId(orgId)
                .hypothesisId(hypothesis.getId())
                .name(request.getName().trim())
                .description(request.getDescription())
                .method(request.getMethod())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : ExperimentStatus.PLANNED)
                .resultMetric(request.getResultMetric())
                .resultValue(request.getResultValue())
                .build();

        if (experiment.getStatus() == ExperimentStatus.RUNNING &&
                (hypothesis.getStatus() == HypothesisStatus.DRAFT || hypothesis.getStatus() == HypothesisStatus.READY)) {
            hypothesis.setStatus(HypothesisStatus.RUNNING);
            hypothesisRepository.save(hypothesis);
        }

        Experiment saved = experimentRepository.save(experiment);
        log.info("Experimento creado id={} para hipótesis={}", saved.getId(), hypothesis.getId());
        return ExperimentResponse.from(saved);
    }

    @Transactional
    public ExperimentResponse updateExperiment(UUID id, UpdateExperimentRequest request, UserPrincipal principal) {
        Experiment experiment = getExperimentEntity(id, principal.getOrganizationId());

        if (request.getName() != null && !request.getName().isBlank()) {
            experiment.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            experiment.setDescription(request.getDescription().trim());
        }
        if (request.getMethod() != null) {
            experiment.setMethod(request.getMethod().trim());
        }
        if (request.getStartDate() != null) {
            experiment.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            experiment.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null) {
            experiment.setStatus(request.getStatus());
        }
        if (request.getResultMetric() != null) {
            experiment.setResultMetric(request.getResultMetric().trim());
        }
        if (request.getResultValue() != null) {
            experiment.setResultValue(request.getResultValue().trim());
        }
        if (request.getConclusion() != null) {
            experiment.setConclusion(request.getConclusion().trim());
        }

        Experiment saved = experimentRepository.save(experiment);
        return ExperimentResponse.from(saved);
    }

    @Transactional
    public ExperimentResponse updateStatus(UUID id, UpdateExperimentStatusRequest request, UserPrincipal principal) {
        Experiment experiment = getExperimentEntity(id, principal.getOrganizationId());
        experiment.setStatus(request.getStatus());

        if (request.getStatus() == ExperimentStatus.RUNNING) {
            Hypothesis hypothesis = hypothesisService.getHypothesisEntity(experiment.getHypothesisId(), principal.getOrganizationId());
            if (hypothesis.getStatus() == HypothesisStatus.DRAFT || hypothesis.getStatus() == HypothesisStatus.READY) {
                hypothesis.setStatus(HypothesisStatus.RUNNING);
                hypothesisRepository.save(hypothesis);
            }
        }

        Experiment saved = experimentRepository.save(experiment);
        log.info("Estado de experimento {} actualizado a {}", id, request.getStatus());
        return ExperimentResponse.from(saved);
    }

    @Transactional
    public ExperimentResponse recordConclusion(UUID id, RecordExperimentConclusionRequest request, UserPrincipal principal) {
        Experiment experiment = getExperimentEntity(id, principal.getOrganizationId());

        experiment.setConclusion(request.getConclusion().trim());
        if (request.getResultMetric() != null) {
            experiment.setResultMetric(request.getResultMetric().trim());
        }
        if (request.getResultValue() != null) {
            experiment.setResultValue(request.getResultValue().trim());
        }
        experiment.setStatus(ExperimentStatus.COMPLETED);

        Experiment saved = experimentRepository.save(experiment);
        log.info("Conclusión registrada para experimento {}: status=COMPLETED", id);
        return ExperimentResponse.from(saved);
    }

    @Transactional
    public void deleteExperiment(UUID id, UserPrincipal principal) {
        Experiment experiment = getExperimentEntity(id, principal.getOrganizationId());
        experimentRepository.delete(experiment);
        log.info("Experimento eliminado: {}", id);
    }
}
