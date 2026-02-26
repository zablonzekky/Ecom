import logging
import time

logger = logging.getLogger(__name__)


class RequestLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start) * 1000)
        logger.info(
            "request method=%s path=%s status=%s duration_ms=%s user=%s",
            request.method,
            request.get_full_path(),
            getattr(response, "status_code", "-"),
            duration_ms,
            request.user.id if getattr(request, "user", None) and request.user.is_authenticated else "anonymous",
        )
        return response
