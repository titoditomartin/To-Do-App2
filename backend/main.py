from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

app = FastAPI()

@app.post("/Tasks/", response_model=TaskModel)
async def add_task(task: TaskBase, database: Session = Depends(get_db)):
    new_task = TodoItem(item=task.item)
    database.add(new_task)
    database.commit()
    database.refresh(new_task)
    return new_task

@app.get("/Tasks/", response_model=List[TaskModel])
async def list_tasks(database: Session = Depends(get_db)):
    return database.query(TodoItem).all()

@app.delete("/Tasks/{task_id}/", response_model=TaskModel)
async def remove_task(task_id: int, database: Session = Depends(get_db)):
    task_to_remove = database.query(TodoItem).filter(TodoItem.id == task_id).first()
    if task_to_remove is None:
        raise HTTPException(status_code=404, detail="Task not found")
    database.delete(task_to_remove)
    database.commit()
    return task_to_remove

@app.put("/Tasks/{task_id}/", response_model=TaskModel)
async def edit_task(task_id: int, task: TaskBase, database: Session = Depends(get_db)):
    task_to_edit = database.query(TodoItem).filter(TodoItem.id == task_id).first()
    if task_to_edit is None:
        raise HTTPException(status_code=404, detail="Task not found")
    task_to_edit.item = task.item
    database.commit()
    database.refresh(task_to_edit)
    return task_to_edit

@app.delete("/Tasks/Clear/", response_model=None)
async def clear_all_tasks(database: Session = Depends(get_db)):
    try:
        database.query(TodoItem).delete()
        database.commit()
    except Exception as e:
        database.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class TaskCompleteBase(BaseModel):
    itemDone: str

class TaskCompleteModel(TaskCompleteBase):
    id: int

    class Config:
        orm_mode = True

@app.post("/FinishedTasks/", response_model=TaskCompleteModel)
async def mark_task_done(done: TaskCompleteBase, database: Session = Depends(get_db)):
    finished_task = FinishedTasks(itemDone=done.itemDone)
    database.add(finished_task)
    database.commit()
    database.refresh(finished_task)
    return finished_task

@app.get("/FinishedTasks/", response_model=List[TaskCompleteModel])
async def list_finished_tasks(database: Session = Depends(get_db)):
    return database.query(FinishedTasks).all()

@app.delete("/FinishedTasks/Clear/", response_model=None)
async def clear_finished_tasks(database: Session = Depends(get_db)):
    try:
        database.query(FinishedTasks).delete()
        database.commit()
    except Exception as e:
        database.rollback()
        raise HTTPException(status_code=500, detail=str(e))
