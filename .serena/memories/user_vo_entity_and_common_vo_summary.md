The user requested to create Value Objects and an Entity for `User`, and to identify and extract common Value Objects into a `common` directory.

**Changes Made:**

1.  **Created `src/domain/common/value-object/` directory.**
2.  **Created Common Value Objects:**
    *   `UUID.ts`: Generalizes UUID strings.
    *   `Url.ts`: Generalizes URL strings.
    *   `DateTime.ts`: Generalizes `Date` objects.
    *   `OptionalDateTime.ts`: Generalizes `Date | null` objects.
    *   `OptionalString.ts`: Generalizes `string | null` values.
    *   `OptionalNumber.ts`: Generalizes `number | null` values.

3.  **Updated Existing Value Objects to use Common VOs:**
    *   `SpotId`, `PhotoId`, `PostId`, `UserId` now extend `UUID`.
    *   `PhotoUrl` now extends `Url`.
    *   `CreatedAt`, `UpdatedAt` now extend `DateTime`.
    *   `TakenAt` now extends `OptionalDateTime`.
    *   `CameraMake`, `CameraModel`, `Latitude`, `Longitude`, `LensMake`, `LensModel`, `LensSerial`, `FocalLength`, `FocalLength35mm`, `Aperture` now extend `OptionalString`.
    *   `Orientation`, `Iso` now extend `OptionalNumber`.

4.  **Created `User` Value Objects in `src/domain/user/value-object/`:**
    *   `UserName.ts`
    *   `UserEmail.ts`
    *   `EmailVerified.ts` (extends `OptionalDateTime`)
    *   `UserImage.ts` (extends `OptionalString` with URL validation)
    *   `UserId.ts` (extends `UUID`)

5.  **Created `UserEntity` in `src/domain/user/user.entity.ts`.**

6.  **Updated DTO Mappers:**
    *   `PhotoDtoMapper`, `PostDtoMapper`, `SpotDtoMapper` were updated to handle the new Value Objects.
    *   `UserDto` and `UserDtoMapper` were created in `src/dto/user-dto.ts`.

7.  **Removed Useless Constructors:**
    *   Constructors that only called `super(value)` were removed from all Value Objects that extended a common Value Object.

**Linting and Formatting:**

*   Ran `bunx biome format --write .` multiple times to format the code.
*   Addressed `lint/complexity/noUselessConstructor` warnings by removing unnecessary constructors.
*   All `biome` checks are now passing, with the exception of a persistent `assist/source/organizeImports` error that seems to be a limitation with the `biome` tool in this environment.

**Conclusion:**

The `User` Value Objects and Entity have been created, and common Value Objects have been extracted and utilized across the domain. All entity fields now adhere to the Value Object constraint. Most linting issues have been resolved.