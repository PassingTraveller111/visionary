import {diagramTableType} from "@/app/api/sql/type";
import {query} from "@/app/api/utils";


const insertDiagram = async (diagram: Pick<diagramTableType, 'data' | 'cover' | 'tags' | 'author_id' | 'title' | 'intro' | 'type'>) => {
    const values = [diagram.title, diagram.data, diagram.intro, diagram.tags, diagram.author_id, diagram.cover, diagram.type];
    return (await query(`INSERT INTO  diagrams (title, data, intro, tags, author_id, cover, type) VALUES (?,?,?,?,?,?,?)`, values) as [ { insertId: number } ] | null);
}

const updateDiagram = async (diagram: Pick<diagramTableType, 'id' |'data' | 'cover' | 'tags' | 'title' | 'intro'>, userId: number) => {
    const values = [diagram.data, diagram.cover, diagram.tags, diagram.title, diagram.intro, new Date()];
    const where = [diagram.id, userId];
    return (await query(`UPDATE diagrams SET data = ?, cover = ?, tags = ?, title = ?, intro = ?, update_time = ? WHERE id = ? AND author_id = ?`, [...values, ...where]) as [ { insertId: number } ] | null);
}

const deleteDiagram = async (diagramId: number, userId: number) => {
    return (await query(`DELETE FROM diagrams WHERE id = ? AND author_id = ?`, [diagramId, userId]));
}

const getDiagram = async (id: number, userId: number) => {
    return (await query(`SELECT * FROM diagrams WHERE id = ? AND author_id = ?`, [id, userId]) as [ diagramTableType[] ] | null);
}

const getDiagramsList = async (userId: number) => {
    return (await query(`SELECT * FROM diagrams`, [userId]) as [ diagramTableType[] ] | null);
}


export const diagram = {
    insertDiagram,
    updateDiagram,
    deleteDiagram,
    getDiagram,
    getDiagramsList,
}

