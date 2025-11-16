The user requested to ensure that all entity fields are Value Objects and to refactor the directory structure for Value Objects, as well as create DTOs for each entity.

**Changes Made:**

1.  **Refactored Directory Structure:**
    *   For each entity (`Spot`, `Photo`, `Post`), a `value-object` subdirectory was created within its entity directory (e.g., `src/domain/spot/value-object`).
    *   Existing value object files were moved into these new `value-object` directories (e.g., `src/domain/spot/spot-id/spot-id.ts` -> `src/domain/spot/value-object/spot-id.ts`).
    *   Old value object subdirectories were deleted.
    *   Imports in the corresponding entity files (e.g., `src/domain/spot/spot.entity.ts`) were updated to reflect the new paths of the value objects.

2.  **Ensured All Entity Fields are Value Objects:**
    *   **`PhotoEntity`**: Created new Value Objects for all primitive fields (e.g., `TakenAt`, `CameraMake`, `Latitude`, `Longitude`, `Orientation`, `Iso`, `LensMake`, `LensModel`, `LensSerial`, `FocalLength`, `FocalLength35mm`, `Aperture`) in `src/domain/photo/value-object/`.
    *   **`PostEntity`**: Created new Value Objects for `createdAt` and `updatedAt` (`CreatedAt`, `UpdatedAt`) in `src/domain/post/value-object/`.
    *   `SpotEntity` already adhered to the constraint.
    *   Updated `PhotoEntity` and `PostEntity` to use these new Value Objects.

3.  **Created DTOs and Mappers:**
    *   `src/dto/spot-dto.ts` was created for `Spot`, including `SpotDtoSchema` (using `zod`), `SpotDto` type, and `SpotDtoMapper` (as a plain object with static methods).
    *   `src/dto/photo-dto.ts` was created for `Photo`, including `PhotoDtoSchema` (using `zod`), `PhotoDto` type, and `PhotoDtoMapper` (as a plain object with static methods).
    *   `src/dto/post-dto.ts` was created for `Post`, including `PostDtoSchema` (using `zod`), `PostDto` type, and `PostDtoMapper` (as a plain object with static methods).
    *   The DTO mappers were refactored from classes with static methods to simple objects with static methods to address `biome`'s `noStaticOnlyClass` warning.

**Linting and Formatting:**

*   Ran `bunx biome format --write .` multiple times to format the code.
*   Addressed `lint/style/useImportType` warnings by manually changing imports to `import type` in entity files.
*   Addressed `lint/complexity/noStaticOnlyClass` by refactoring DTO mappers.
*   All `biome` checks are now passing.

**Conclusion:**

The directory structure has been refactored, all entity fields are now Value Objects, and DTOs with mappers have been created. All linting and formatting issues have been resolved.