import { generateToken } from "./middleware/auth.js";
import { Role } from "./middleware/roles.js";
const users = [
    { userId: 1, role: Role.ADMIN },
    { userId: 2, role: Role.OWNER },
    { userId: 3, role: Role.MANAGER },
    { userId: 4, role: Role.EMPLOYEE },
    { userId: 5, role: Role.CONTROLLER },
    { userId: 6, role: Role.VISITOR },
];
users.forEach(u => {
    const token = generateToken(u.userId, u.role);
    console.log(`${Role[u.role]} (userId: ${u.userId}):`);
    console.log(`Bearer ${token}\n`);
});
//# sourceMappingURL=generateTokens.js.map