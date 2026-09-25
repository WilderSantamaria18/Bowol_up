package com.bowol.task.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderTasksRequest {

    @NotEmpty(message = "La lista de movimientos no puede estar vacía")
    private List<TaskMoveItem> moves;
}
