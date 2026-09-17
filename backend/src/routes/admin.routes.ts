import { Router } from "express";

import {
  dashboard,
  getUsers,
  changeUserRole,
  inviteUser,
  addCategory,
  listCategories,
  editCategory,
  removeCategory,
  assignTicketToAgent,
} from "../controllers/admin.controller";

import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

router.get(
  "/dashboard",
  dashboard
);

router.get(
  "/users",
  getUsers
);

router.post(
  "/users/invite",
  inviteUser
);

router.put(
  "/users/:id/role",
  changeUserRole
);

router.get(
  "/categories",
  listCategories
);

router.post(
  "/categories",
  addCategory
);

router.put(
  "/categories/:id",
  editCategory
);

router.delete(
  "/categories/:id",
  removeCategory
);

router.put(
  "/tickets/:id/assign",
  assignTicketToAgent
);

export default router;