package com.bowol.businessprofile.dto;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalItem implements Serializable {
    private String text;
    private Integer priority;
}
