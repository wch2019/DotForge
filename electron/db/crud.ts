import { getDb } from './index';
import { projects } from './schema';
import { eq } from 'drizzle-orm';


export function createProject(data: Omit<typeof projects.$inferInsert, 'id'>) {
    console.log('createProject', data);
    const db = getDb();
    return db.insert(projects).values(data).returning();
}

export function getProjects() {
    const db = getDb();
    return db.select().from(projects).all();
}

export function getProjectById(id: number) {
    const db = getDb();
    return db.select().from(projects).where(eq(projects.id, id)).get();
}

export function updateProject(id: number, data: Partial<typeof projects.$inferUpdate>) {
    const db = getDb();
    return db.update(projects).set(data).where(eq(projects.id, id)).returning();
}

export function deleteProject(id: number) {
    const db = getDb();
    return db.delete(projects).where(eq(projects.id, id)).returning();
}
