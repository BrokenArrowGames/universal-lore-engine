import { UserEntity } from "@db/entity/user.entity";
import { UserDto, UserDtoFromEntity, UserEntityFromDto } from "@mod/user/user.dto";
import { RandomMockUser } from "@test/util/mock-user";
import { RandomIntInRange, RandomName } from "@test/util/random";

describe('UserEntityFromDto', () => {
  it('to only have expected properties', () => {
    const dto: UserDto = {
      id: RandomIntInRange(0,9999),
      name: RandomName()
    };

    const entity = UserEntityFromDto(dto);

    expect(entity).toStrictEqual({
      id: dto.id,
      name: dto.name
    });
  });
});


describe('UserDtoFromEntity', () => {
  it('to only have expected properties', () => {
    const entity: UserEntity = RandomMockUser();

    const dto = UserDtoFromEntity(entity);

    expect(dto).toStrictEqual({
      id: entity.id,
      name: entity.name,
    });
  });
});
