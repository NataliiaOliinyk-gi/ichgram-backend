import { Request, Response } from "express";

import * as notificationsService from "../services/notifications.service";
import parsePaginationParams from "../utils/parsePaginationParams";

import { AuthenticatedRequest } from "../typescript/interfaces";

export const getNotificationsController = async (
  req: Request,
  res: Response
): Promise<void> => {
   const { page, limit } = parsePaginationParams(req.query);
  const result = await notificationsService.getNotifications(
    (req as AuthenticatedRequest).user,
     { page, limit }
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
