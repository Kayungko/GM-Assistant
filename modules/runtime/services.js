(function () {
  const root = window.__gmHelperRuntime = window.__gmHelperRuntime || {};

  root.createRuntimeServices = function createRuntimeServices(runtime) {
    return {
      catalogService: {
        rebuild: async () => runtime.rebuildCatalogStore(),
        merge: (builtin, externalSnapshots, imported) => runtime.mergeCatalogSources(builtin, externalSnapshots, imported)
      },
      targetWriter: {
        fill: (text) => runtime.writeToTarget(text, false),
        append: (text) => runtime.writeToTarget(text, true),
        resolveTarget: () => runtime.findWritableTarget()
      },
      versionService: {
        checkLatestRelease: async (options) => runtime.checkLatestRelease(options),
        maybeAutoCheckLatestRelease: async () => runtime.maybeAutoCheckLatestRelease(),
        getReleasePageUrl: () => runtime.getReleasePageUrlFromUpdateState()
      }
    };
  };
})();

