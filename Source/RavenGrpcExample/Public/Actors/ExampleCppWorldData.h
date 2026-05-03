// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ExampleCppWorldData.generated.h"

UCLASS()
class RAVENGRPCEXAMPLE_API AExampleCppWorldData : public AActor
{
	GENERATED_BODY()

public:
	// Sets default values for this actor's properties
	AExampleCppWorldData();

protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "gRPC", meta = (ClampMin = "1", UIMin = "1"))
	int32 WorldId = 1;
};
