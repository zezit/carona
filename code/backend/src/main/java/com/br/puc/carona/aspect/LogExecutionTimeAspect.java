package com.br.puc.carona.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * Aspect for handling LogExecutionTime annotation.
 * This aspect logs the execution time of methods annotated
 * with @LogExecutionTime.
 */
@Aspect
@Component
@Slf4j
public class LogExecutionTimeAspect {

    /**
     * Around advice to measure and log method execution time.
     *
     * @param joinPoint the join point representing the method execution
     * @return the result of the method execution
     * @throws Throwable if the method execution throws an exception
     */
    @Around("@annotation(com.br.puc.carona.annotation.LogExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();

        String methodName = methodSignature.getName();
        String className = methodSignature.getDeclaringType().getSimpleName();

        long startTime = System.currentTimeMillis();

        Object result = joinPoint.proceed();

        long executionTime = System.currentTimeMillis() - startTime;

        log.info("{}#{} executed in {} ms", className, methodName, executionTime);

        return result;
    }
}