---
name: api-conventions
description: API design patterns for this codebase
---

При создании API-эндпоинтов:

- Используй RESTful именование
- Возвращай ошибки в формате { error: string, code: number }
- Добавляй DTO-объекты для входных и выходных данных, если их нет в apps/api/src/dto
- Логируй все мутации через logger
- Пиши юнит-тесты для новых эндпоинтов
