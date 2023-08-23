import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import {
  DeleteList,
  ListDto,
  ListType,
  ListTypeDto,
  ListTypesDto,
  UpdateList,
} from './dtos/list.dto';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/role /role.guard';
import { Roles } from 'src/guards/role /roles-auth.decorator';
import { UserRole } from 'src/typeorm/entitys/user.entity';

@Controller('lists')
export class ListsController {
  constructor(private readonly listService: ListsService) {}

  @Get('')
  async getLists(@Query() dto: ListTypesDto) {
    const lists = await this.listService.getList(dto.type);

    return lists;
  }

  @Post('')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard)
  async addList(@Body() dto: ListDto) {
    const faculty = await this.listService.addList(dto.type, dto.name);
    return faculty;
  }

  @Delete('')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard)
  async deleteList(@Body() dto: DeleteList) {
    const faculty = await this.listService.removeList(dto.type, dto.id);
    return faculty;
  }

  @Patch('')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard)
  async updateList(@Body() dto: UpdateList) {
    const faculty = await this.listService.updateList(
      dto.type,
      dto.id,
      dto.name,
    );
    return faculty;
  }
}
