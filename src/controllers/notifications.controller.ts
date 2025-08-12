import { Request, Response } from "express";

import * as notificationsService from "../services/notifications.service";

import { AuthenticatedRequest } from "../typescript/interfaces";

export const getNotificationsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await notificationsService.getNotifications(
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};

export const markAsReadController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const result = await notificationsService.markAsRead(
    id,
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};
