The user requested to enforce a rule where Value Objects should not hold `null` values directly, and instead, `null` should be handled at the Entity level by declaring the property as `ValueObject | null`.

**Changes Made:**

1.  **Refactored Common Value Objects:**
    *   Deleted `src/domain/common/value-object/optional-date-time.ts`.
    *   Renamed `src/domain/common/value-object/optional-string.ts` to `src/domain/common/value-object/string.ts` and modified its content to be a non-nullable `StringValue`.
    *   Renamed `src/domain/common/value-object/optional-number.ts` to `src/domain/common/value-object/number.ts` and modified its content to be a non-nullable `NumberValue`.

2.  **Updated Value Objects to be Non-Nullable:**
    *   All Value Objects that previously extended `OptionalDateTime`, `OptionalString`, or `OptionalNumber` were updated to extend `DateTime`, `StringValue`, or `NumberValue` respectively, and their constructors were modified to only accept non-null values.
    *   `PhotoExif`, `UserName`, `UserEmail`, `UserImage` were also updated to only accept non-null values in their constructors.

3.  **Updated Entities to Handle Nullability:**
    *   **`PhotoEntity`**: Properties that can be `null` (e.g., `exif`, `takenAt`, `cameraMake`, etc.) were updated to be `ValueObject | null`. The constructor and update methods were also adjusted.
    *   **`UserEntity`**: Properties that can be `null` (e.g., `name`, `email`, `emailVerified`, `image`) were updated to be `ValueObject | null`. The constructor and update methods were also adjusted.

4.  **Updated DTO Mappers:**
    *   **`PhotoDtoMapper`**: The `fromEntity` and `toEntity` methods were updated to correctly convert between nullable DTO properties and `ValueObject | null` Entity properties.
    *   **`UserDtoMapper`**: The `fromEntity` and `toEntity` methods were updated to correctly convert between nullable DTO properties and `ValueObject | null` Entity properties.

5.  **Removed Useless Constructors:**
    *   Constructors that only called `super(value)` were removed from all Value Objects that extended a common Value Object.

**Linting and Formatting:**

*   All `biome` checks are now passing after addressing all `lint/complexity/noUselessConstructor`, `lint/correctness/noUnusedImports`, and formatting issues.

**Conclusion:**

The Value Object nullability constraint has been successfully implemented across the domain, and all related code has been updated and verified.