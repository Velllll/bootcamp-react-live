import { Test, TestingModule } from '@nestjs/testing';
import { ScimagojrService } from './scimagojr.service';

describe('ScimagojrService', () => {
  let service: ScimagojrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScimagojrService],
    }).compile();

    service = module.get<ScimagojrService>(ScimagojrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
