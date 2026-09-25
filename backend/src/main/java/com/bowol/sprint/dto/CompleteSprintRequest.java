package com.bowol.sprint.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompleteSprintRequest {

    private UUID moveToSprintId;

    @Builder.Default
    private Boolean moveToBacklog = true;
}
