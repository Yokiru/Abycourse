type SyncExecutable<T> = {
  sync(): T | Promise<T>;
};

type AllExecutable<T> = {
  all(): T | Promise<T>;
};

type GetExecutable<T> = {
  get(): T | Promise<T>;
};

type RunExecutable<T> = {
  run(): T | Promise<T>;
};

function hasMethod<TMethod extends string>(
  value: unknown,
  method: TMethod,
): value is Record<TMethod, () => unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    method in value &&
    typeof (value as Record<TMethod, unknown>)[method] === "function"
  );
}

export async function executeRead<T>(
  value: T | Promise<T> | SyncExecutable<T>,
): Promise<T> {
  if (hasMethod(value, "sync")) {
    return await value.sync();
  }

  return await value;
}

export async function executeMany<T>(
  value: T | Promise<T> | AllExecutable<T> | SyncExecutable<T>,
): Promise<T> {
  if (hasMethod(value, "all")) {
    return await value.all();
  }

  return await executeRead(value);
}

export async function executeGet<T>(
  value: T | Promise<T> | GetExecutable<T> | SyncExecutable<T>,
): Promise<T> {
  if (hasMethod(value, "get")) {
    return await value.get();
  }

  return await executeRead(value);
}

export async function executeRun<T>(
  value: T | Promise<T> | RunExecutable<T>,
): Promise<T> {
  if (hasMethod(value, "run")) {
    return await value.run();
  }

  return await value;
}
