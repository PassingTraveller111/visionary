

export const createUpdateSql= <updateDataType, whereValueType>(table: string, updateData: updateDataType, whereField: string, whereValue: whereValueType) => {
    let sql = `UPDATE ${table} SET`;
    const values = [];
    const fields = [];
    for (const key in updateData) {
        fields.push(`${key} =?`);
        values.push(updateData[key]);
    }
    sql += fields.join(', ');
    sql += ` WHERE ${whereField} =?`;
    values.push(whereValue);
    return {
        sql,
        values,
    }
}