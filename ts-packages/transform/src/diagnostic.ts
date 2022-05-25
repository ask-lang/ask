/* eslint-disable @typescript-eslint/no-explicit-any */
import { DiagnosticEmitter, DiagnosticCategory } from "visitor-as/as";

export class DiagnosticMode {
    warning: any = null;
    warningRelated: any = null;
    strictly = true;

    change(emitter: DiagnosticEmitter): void {
        if (this.strictly) {
            this.strictly = false;
            this.warning = emitter.warning;
            this.warningRelated = emitter.warningRelated;
            emitter.warning = emitter.error;
            emitter.warningRelated = emitter.errorRelated;
        } else {
            this.strictly = true;
            emitter.warning = this.warning;
            emitter.warningRelated = this.warningRelated;
        }
    }
}

/**
 *
 * @param emitter
 * @returns return true if emitter have ERROR message
 */
export function hasErrorMessage(emitter: DiagnosticEmitter): boolean {
    return hasMessage(emitter, DiagnosticCategory.ERROR);
}

/**
 *
 * @param emitter
 * @returns return true if emitter have WARNING message
 */
export function hasWarningMessage(emitter: DiagnosticEmitter): boolean {
    return hasMessage(emitter, DiagnosticCategory.WARNING);
}

function hasMessage(
    emitter: DiagnosticEmitter,
    category: DiagnosticCategory
): boolean {
    const diagnostics = emitter.diagnostics ? emitter.diagnostics : [];
    for (const msg of diagnostics) {
        if (msg.category === category) {
            return true;
        }
    }
    return false;
}
