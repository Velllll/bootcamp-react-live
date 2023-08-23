import { Test, TestingModule } from '@nestjs/testing';
import { OpenAlexService } from './open-alex.service';

describe('OpenAlexService', () => {
  let service: OpenAlexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAlexService],
    }).compile();

    service = module.get<OpenAlexService>(OpenAlexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
