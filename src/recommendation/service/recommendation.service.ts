import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async createRecommendation(
    sourceItemId: string,
    recommendedItemId: string,
  ): Promise<object> {
    if (sourceItemId === recommendedItemId) {
      throw new BadRequestException('An item cannot recommend itself.');
    }

    const existingRecommendation = await this.prisma.recommendation.findUnique({
      where: {
        sourceItemId_recommendedItemId: { sourceItemId, recommendedItemId },
      },
    });

    if (existingRecommendation) {
      throw new BadRequestException('This recommendation already exists.');
    }

    const lastOrder = await this.prisma.recommendation.aggregate({
      where: { sourceItemId },
      _max: { orderIndex: true },
    });

    const nextOrderIndex = (lastOrder._max.orderIndex || 0) + 1;

    return this.prisma.recommendation.create({
      data: {
        sourceItemId,
        recommendedItemId,
        orderIndex: nextOrderIndex,
      },
    });
  }

  async getRecommendations(sourceItemId: string) {
    return this.prisma.recommendation.findMany({
      where: { sourceItemId },
      include: { recommendedItem: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async deleteRecommendation(recommendationId: string) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new NotFoundException(
        `Recommendation with ID '${recommendationId}' not found.`,
      );
    }

    return this.prisma.recommendation.delete({
      where: { id: recommendationId },
    });
  }

  async updateRecommendationOrder(
    sourceItemId: string,
    recommendationId: string,
    newOrderIndex: number,
  ): Promise<object> {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new NotFoundException(
        `Recommendation with ID '${recommendationId}' not found.`,
      );
    }

    if (recommendation.sourceItemId !== sourceItemId) {
      throw new BadRequestException(
        `Recommendation does not belong to the specified source item.`,
      );
    }

    const recommendations = await this.prisma.recommendation.findMany({
      where: { sourceItemId },
      orderBy: { orderIndex: 'asc' },
    });

    const filteredRecommendations = recommendations.filter(
      (rec) => rec.id !== recommendationId,
    );

    const updatedRecommendations = [
      ...filteredRecommendations.slice(0, newOrderIndex),
      recommendation,
      ...filteredRecommendations.slice(newOrderIndex),
    ];

    const updatePromises = updatedRecommendations.map((rec, index) =>
      this.prisma.recommendation.update({
        where: { id: rec.id },
        data: { orderIndex: index },
      }),
    );

    await Promise.all(updatePromises);

    return { message: 'Recommendation order updated successfully' };
  }
}
