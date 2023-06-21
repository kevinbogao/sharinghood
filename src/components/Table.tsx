import type { ReactElement } from "react";
import { useState } from "react";

import { Icon } from "./Icon";

type TEntity = Record<string, unknown>;

export type TColumn<TRow extends TEntity> = {
  [K in keyof TRow]: { key: K; label: string; render?: (value: TRow[K]) => ReactElement | string };
}[keyof TRow];

export interface ITable<T extends TEntity> {
  columns: Array<TColumn<T>>;
  rows: Array<T>;
}

export const Table = <T extends TEntity>({ rows, columns }: ITable<T>): ReactElement => {
  const [sortOrder, setSortOrder] = useState(-1);
  const [selectedKey, setSelectedKey] = useState<keyof T>("id");

  const renderCell = (key: keyof T, row: T, render?: TColumn<T>["render"]): any => {
    const value = row[key];

    if (render) {
      return render(value);
    }

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "boolean") {
      return value ? "True" : "False";
    }

    return value ?? "-";
  };

  const sortColumns = (key: keyof T): void => {
    setSelectedKey(key);

    rows.sort((a, b) => {
      const left = a[key];
      const right = b[key];

      if (typeof left === "number" && typeof right === "number") {
        return sortOrder * (left - right);
      }

      if (left && right && left < right) {
        return sortOrder * -1;
      }

      return sortOrder;
    });

    setSortOrder((prev) => prev * -1);
  };

  return (
    <table className="mt-2 w-full table-auto text-center">
      <thead>
        <tr>
          {columns.map(({ key, label }) => (
            <th
              className="cursor-pointer py-1 text-sm font-semibold hover:bg-stone-100"
              key={key as string}
              onClick={() => sortColumns(key)}
            >
              <div className="flex items-center justify-center">
                <p className="text-sm">{label}</p>
                {selectedKey === key && <Icon className="ml-2 w-2" type={sortOrder === -1 ? "angleUp" : "angleDown"} />}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr className="group hover:bg-stone-100" key={idx}>
            {columns.map(({ key, render }) => (
              <td className="py-1 text-sm" key={key as string}>
                {renderCell(key, row, render)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
