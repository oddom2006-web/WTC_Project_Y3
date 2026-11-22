<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Branch::class);

        $branches = Branch::orderBy('name')->get();

        return response()->json([
            'branches' => $branches->map(fn (Branch $b) => $b->toApiArray()),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Branch::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'lat'  => ['nullable', 'numeric'],
            'lng'  => ['nullable', 'numeric'],
        ]);

        $branch = Branch::create($data);

        return response()->json(['branch' => $branch->toApiArray()], 201);
    }

    public function update(Request $request, Branch $branch)
    {
        $this->authorize('update', $branch);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'lat'  => ['nullable', 'numeric'],
            'lng'  => ['nullable', 'numeric'],
        ]);

        $branch->update($data);

        return response()->json(['branch' => $branch->fresh()->toApiArray()]);
    }

    public function destroy(Branch $branch)
    {
        $this->authorize('delete', $branch);
        $branch->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
