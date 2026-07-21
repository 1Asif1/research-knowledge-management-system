package com.clarivate.reviewservice.dto.Request;

import com.clarivate.reviewservice.Enums.EditorDecision;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EditorDecisionRequest {
    @NotNull
    private EditorDecision decision;

}
