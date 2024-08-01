import { Test, TestingModule } from '@nestjs/testing';
import { BootstrapService } from '../../../../src/bootstrap/bootstrap.service';
import { TestBed } from '@automock/jest';

describe('BootstrapService', () => {
  let service: BootstrapService;

  beforeEach(async () => {
    const { unit } = TestBed.create(BootstrapService)
      .compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
