<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\Paginator;

abstract class BaseRepository
{
    protected Model $model;

    abstract public function getModel(): string;

    public function __construct()
    {
        $this->model = app($this->getModel());
    }

    public function all()
    {
        return $this->model->all();
    }

    public function paginate(int $perPage = 15)
    {
        return $this->model->paginate($perPage);
    }

    public function find(int $id)
    {
        return $this->model->find($id);
    }

    public function findOrFail(int $id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data)
    {
        $model = $this->findOrFail($id);
        $model->update($data);
        return $model;
    }

    public function delete(int $id): bool
    {
        return $this->findOrFail($id)->delete();
    }

    public function where(array $conditions)
    {
        return $this->model->where($conditions);
    }

    public function withTrashed()
    {
        if (method_exists($this->model, 'withTrashed')) {
            return $this->model->withTrashed();
        }
        return $this->model;
    }
}
